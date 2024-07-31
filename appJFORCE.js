import { LightningElement, track, wire } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getActiveAppointmentSlots from '@salesforce/apex/AppJfCon.getActiveAppointmentSlots';
import checkDuplicateAppointment from '@salesforce/apex/AppJfCon.checkDuplicateAppointment';
import checkSlotAvailability from '@salesforce/apex/AppJfCon.checkSlotAvailability';


export default class AppJFORCE extends LightningElement 
{
   @track name;
    @track contact;
    @track subject;
    @track appointmentDate;
    @track appointmentTime;
    @track description;
    @track resultMessage;
    @track appointmentSlots;
    @track notAvailableslot;
    @track resultMessage2;
   

   

    handleNameChange(event) {
        this.name = event.target.value;
    }

    handleContactChange(event) {
        this.contact = event.target.value;
    }

    handleSubjectChange(event) {
        this.subject = event.target.value;
    }

    
    handleDescriptionChange(event) {
        this.description = event.target.value;
    }

    handleDateChange(event) {
        this.appointmentDate = event.target.value;
        
    }
    
    handleTimeChange(event) {
        this.appointmentTime = event.target.value; 
        
    }




    @wire(getActiveAppointmentSlots)
    wiredAppointmentSlots({ error, data }) {
        if (data) {
            this.appointmentSlots = data;
        } else if (error) {
            console.error('Error fetching appointment slots:', error);
        }
    }

   
    
    //method to check the appointment are aldready exist or not
    handleCheckDuplicate() {
         checkDuplicateAppointment({ 
            appointmentDate: this.appointmentDate,
            appointmentTime: this.appointmentTime
            
        })
        .then(result => {
            
            console.log("result",result);
            if (result) {
                this.resultMessage = "Appointment already exists for this date and time.";
                //return Promise.reject(this.resultMessage);
            }
            else {
                this.resultMessage= "Appointment not exist..!!You can create Appointment.";
               // return Promise.reject(this.resultMessage);
            }
        })
        .catch(error => {
            this.resultMessage = "Error",error;
            console.log("Error is",error)
        });
            
        
    }


    //method to check the appointment are within slot or not
    handleCheckSlot()
    {
     checkSlotAvailability({ 
        appointmentDate: this.appointmentDate,
        appointmentTime: this.appointmentTime
    })
        .then(result => {
            if (result) {
                this.resultMessage2 = "Appointment slot is available.";
                return;
            } else {
                this.resultMessage2 = "Appointment slot is not available..!!Please select available slot";
                //return Promise.reject(this.resultMessage);
            }
        })
        .catch(error => {
            this.resultMessage2 = "error",error;
            console.log("Error is",error)
        });
    
    
}
    
    
   
        //Method for validate the form
        validateForm()
         {
            // if (!this.name || !this.contact || !this.subject || !this.appointmentDate || !this.appointmentTime || !this.description) {
            if (!this.contact || !this.subject || !this.appointmentDate || !this.appointmentTime || !this.description) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Please fill in all required fields.',
                        variant: 'error'
                    })
                );
                return false;
            }
            return true;
        }



 //save the form
    handleSave() {
        // Prepare fields to create a new record

        if (!this.validateForm()) {
            return;
        }

        const fields = {
           'Name':this.name,
            'Contact__c': this.contact,
            'Subject__c': this.subject,
            'Appointment_Date__c': this.appointmentDate,
            'Appointment_Time__c': this.appointmentTime,
            'Description__c':this.description

        };
        
        // Create a new record using LDS UI API
        // createRecord func from Lightning Data Service (LDS) API that creates a new record in Salesforce.
        //apiName: The API name of the Salesforce object you want to create a record for. 
        //In this case, 'AppointmentDetail__c' is a custom object.
         //fields: An object containing the fields and their values that you want to set for the new record.
        createRecord({ apiName: 'Appointment_Detail__c', fields })
            .then(result => {
                //The result parameter contains details about the newly created record, such as its ID
                // Clear the form and show success message
                //Clear Form Fields: Resets the values of the form fields to empty strings, effectively clearing the form after successful record creation.
                this.name= '';
                this.contact = '';
                this.subject = '';
                this.appointmentDate = '';
                this.appointmentTime= '';
                this.description = '';
                //Success Handling:
                this.dispatchEvent(
                    //new ShowToastEvent({...}): Creates a toast notification event to show a message to the user
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Appointment created successfully',
                        variant: 'success'//Specifies the type of toast message (in this case, a success message)
                    })
                );
            })
            //Error Handling:
            .catch(error => {
                // Handle error
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });


        }
    
    
}