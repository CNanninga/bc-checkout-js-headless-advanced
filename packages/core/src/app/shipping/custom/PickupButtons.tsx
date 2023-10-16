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
    constructor(props: PickupButtonsProps & WithCheckoutPickupButtonsProps) {
        super(props)
  
        this.state = {
            isLoading: false,
        }
    }
  
    render(): ReactNode {
        const { isLoading } = this.state
  
        if(isLoading) {
            return <div>Loading...</div>
        } else {
            return <div>Hello World</div>
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
