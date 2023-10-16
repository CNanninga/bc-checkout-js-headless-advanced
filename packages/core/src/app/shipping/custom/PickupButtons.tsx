import React, { Component, ReactNode }  from 'react'
import { 
    Address, 
    Consignment, 
    CheckoutSelectors, 
    AddressRequestBody, 
    ShippingRequestOptions, 
    CheckoutParams 
} from '@bigcommerce/checkout-sdk';
import { withCheckout } from '../../checkout';
import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';
import { SingleShippingFormValues } from '../SingleShippingForm';

import { Button, ButtonVariant } from '../../ui/button';

export interface PickupButtonsState {
    isLoading: boolean;
}

export interface PickupButtonsProps {
    getPickupAddress: () => Address;
    getEmptyAddress: () => Address;
    isPickup: (consignments?: Consignment[]) => boolean;
    handleSingleShippingSubmit: (values: SingleShippingFormValues) => void;
}

export interface WithCheckoutPickupButtonsProps {
    deleteConsignment: (consignmentId: string) => Promise<CheckoutSelectors>;
    getConsignments: () => Consignment[] | undefined;
    updateShippingAddress: (
        address: Partial<AddressRequestBody>, 
        options?: ShippingRequestOptions<CheckoutParams>
    ) => Promise<CheckoutSelectors>;
    selectShippingOption: (
        shippingOptionId: string, 
        options?: ShippingRequestOptions
    ) => Promise<CheckoutSelectors>;
}

class PickupButtons extends Component<PickupButtonsProps & WithCheckoutPickupButtonsProps, PickupButtonsState> {
    private pickupAddress = this.props.getPickupAddress();
    private consignments = this.props.getConsignments();

    constructor(props: PickupButtonsProps & WithCheckoutPickupButtonsProps) {
        super(props)
  
        this.state = {
            isLoading: false,
        }
    }

    handlePickupClick: () => Promise<void> = async () => {
        const { pickupAddress, props } = this;
        const {
            deleteConsignment,
            getConsignments,
            handleSingleShippingSubmit,
            updateShippingAddress,
            selectShippingOption
        } = props;
  
        this.setState({ isLoading: true });
        const consignments = getConsignments();
        if(consignments?.length) {
            const promises: Promise<CheckoutSelectors>[] = [];
            consignments?.forEach(({id}) => promises.push(deleteConsignment(id)));
            await Promise.all(promises);
        }
  
        const state = await updateShippingAddress(pickupAddress);
        const updatedConsignments = state.data.getConsignments();
        if(updatedConsignments 
            && updatedConsignments[0].availableShippingOptions?.length
        ) {
            await selectShippingOption(
                updatedConsignments[0].availableShippingOptions[0].id
            );
            await handleSingleShippingSubmit({
                shippingAddress: pickupAddress,
                billingSameAsShipping: false,
                orderComment: "Pickup in-store",
            });
        }
  
        this.setState({ isLoading: false });
    }

    handleShipToMeClick: () => Promise<void> = async () => {
        const { consignments, props } = this;
        const { updateShippingAddress, getEmptyAddress } = props;
       
        const promises: Promise<CheckoutSelectors>[] = [];
        consignments?.forEach(
            () => promises.push(updateShippingAddress(getEmptyAddress()))
        );
        if(promises.length) {
            this.setState({ isLoading: true });
            await Promise.all(promises);
            this.setState({ isLoading: false });
        }  
    }
  
    render(): ReactNode {
        const { isLoading } = this.state;
        const {
            isPickup,
            getConsignments
        } = this.props;
        const consignments = getConsignments();
        const pickup = isPickup(consignments ? consignments : []);
  
        if (isLoading) {
            return <div>Loading...</div>
        } else if (pickup) {
            return (
                <div>
                    <h3>Currently Picking Up In-Store</h3>
                    <div>Choose an option below</div>
                    <Button
                        variant={ButtonVariant.Primary}
                        onClick={this.handlePickupClick}>
                        Continue with Pickup
                    </Button>
                    <span>&nbsp;-- or --&nbsp;</span>
                    <Button
                        variant={ButtonVariant.Primary}
                        onClick={this.handleShipToMeClick}>
                        Ship to Me
                    </Button>
                </div>
            )
        } else {
            return (
                <div>
                    <h3>Currently Shipping to You</h3>
                    <div>
                        Enter your shipping address, 
                        or click the button below to pickup 
                        in store instead.
                    </div>
                    <Button
                        variant={ButtonVariant.Primary}
                        onClick={this.handlePickupClick}>
                        Pickup In-Store
                    </Button>
                </div>
            )
        }
    }
}

function mapToPickupButtonsProps({
    checkoutService,
    checkoutState
 }: CheckoutContextProps): WithCheckoutPickupButtonsProps {
    const {
        deleteConsignment,
        updateShippingAddress,
        selectShippingOption,
    } = checkoutService;
  
    const {
        getConsignments
    } = checkoutState.data;
  
    return {
        deleteConsignment,
        updateShippingAddress,
        selectShippingOption,
        getConsignments,
    }
}

export default withCheckout(mapToPickupButtonsProps)(PickupButtons);
