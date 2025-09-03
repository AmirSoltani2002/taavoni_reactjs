export type LoginData =  {
    email: string;
    password: string;
    type: string;
}

export type SignupData = {
    firstName: string;
    lastName: string;
    nationalId: string;
    birthDate: string;
    email: string;
    phoneNumber: string;
    homePhoneNumber: string;
    workPhoneNumber: string;
    address: string;
    idCardImage: File | null;
    password: string;
    type: string;
    sex: 'male' | 'female';
    isargary_percent?: string;
    azade_esarat_months?: number;
    azade_months?: number;
    shahed_family_number?: number;
    khanevade_shahed_type?: string;
}

export const SignupDataMap = {
    'نام': 'firstName',
    'نام خانوادگی': 'lastName',
    'کدملی': 'nationalId',
    'تاریخ تولد': 'birthDate',
    'ایمیل': 'email',
    'شماره تلفن همراه': 'phoneNumber',
    'شماره تلفن منزل': 'homePhoneNumber',
    'شماره تلفن محل کار': 'workPhoneNumber',
    'آدرس': 'address'
}