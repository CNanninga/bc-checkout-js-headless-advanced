import React, { Component, ReactNode }  from 'react'
import { Address,  Consignment } from '@bigcommerce/checkout-sdk';
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

class PickupButtons extends Component<PickupButtonsProps , PickupButtonsState> {
    constructor(props: PickupButtonsProps) {
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

export default PickupButtons;
