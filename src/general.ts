import Cookies from "js-cookie";
import { api_base_url } from "./config";
import { toast } from "sonner";

export const getToken = () => {
  return Cookies.get('token') || '';
}

const getFarsiError = (err: string) => {
  const Errors: {
    [k: string]: string
  } = {
    '401': 'توکن شما منقضی شده است. لطفا دوباره وارد شوید',
    '409': 'اطلاعات تکراری است و قابل ثبت نمی‌باشد',
    'homephone must be a valid phone number': 'شماره منزل باید شماره درست باشد.',
    'mobile must be a valid phone number': 'شماره موبایل باید شماره درست باشد.',
    'workphone must be a valid phone number': 'شماره محل کار باید شماره درست باشد.',
    'sex should not be empty': 'لطفا جنسیت را مشخص کنید',
    'email must be an email': 'ایمیل وارد شده صحیح نمی‌باشد',
    'type should not be empty': 'نوع حساب کاربری را تعیین کنید',
    'password is not strong enough': 'لطفا رمز عبور قوی‌تری انتخاب کنید',
    'shahedrelation must be one of the following values: azade_wife, azade_child, jan_wife, jan_child': 'لطفا ارتباط خود با ایثارگر را مشخص کنید',

    'floorcount must be a number conforming to the specified constraints': 'لطفا تعداد طبقات را مشخص کنید',
    'startdate must be a date instance': 'تاریخ شروع پروژه را مشخص کنید',
    'enddate must be a date instance': 'تاریخ پایان پروژه را مشخص کنید',

  }

  const Skips: string[] = [
    'type must be one of the following values: system, admin, tehranuni, otheruni, free, employee',

  ]
  if(Skips.includes(err.toLowerCase())) {
    return null;
  }
  if(Object.keys(Errors).includes(err.toLowerCase())) {
    return Errors[err.toLowerCase()];
  } else {
    return err;
  }
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export function postData<Type>(endpoint: string, data: Type, tokenRequired: boolean = true) {
  // Default options are marked with *
  const token = getToken();
  return fetch(`${api_base_url}${endpoint}`, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    // mode: 'cors', // no-cors, *cors, same-origin
    // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      'Authorization': (token && tokenRequired) ? `Bearer ${token}`: ''
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  })
  .then(response => response.json()) // parses JSON response into native JavaScript objects
}

export const getTable = async(tableName: string, onGot?: (data: any) => void, verbose: boolean=true) => {
  const token =  getToken()
  try{
    const resp = await fetch(`${api_base_url}/${tableName}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}`: ''
      }
    });
    if(resp.ok){
      const data = await resp.json();
      if(onGot){
        onGot(data);
      } else {
        return data;
      }
    } else if(resp.status === 401) {
      toast.error(getFarsiError('401'));
      // Go to login page
      await sleep(3000);
      window.location.href = '/';
      return [];
    } else {
      if(verbose){
        const err = await resp.json();
        if(err.message){
          if(typeof err.message === 'object') {
            Object.values(err.message).forEach((m: any) => {
              const msg = getFarsiError(m);
              if(msg){
                toast.error(getFarsiError(m));
              }
            });
            return;
          }
          toast.error(err.message);
        }
        else {
          toast.error('خطایی رخ داده است');
        }
      }
    }
  } catch (err: any) {
    if(verbose){
      if(err.message){
        toast.error(err.message);
      } else {
        toast.error('خطایی رخ داده است');
      }
    }
    return []
  } 
}

export const postTable = async(tableName: string, row: any, onPosted?: (data: any) => void, verbose: boolean=true) => {
  const token =  getToken()
  try{
    const resp = await fetch(`${api_base_url}/${tableName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}`: ''
      },
      body: JSON.stringify(row)
    });
    if(resp.ok){
      const data = await resp.json();
      console.info({data});
      if(onPosted){
        onPosted(data);
      } else {
        return data;
      }
    } else if(resp.status === 401) {
      toast.error(getFarsiError('401'));
      // Go to login page
      await sleep(3000);
      window.location.href = '/';
      return [];
    } else if(resp.status === 409) {
      toast.error(getFarsiError('409'))
    } else {
      if(verbose){
        const err = await resp.json();
        if(err.message){
          if(typeof err.message === 'object') {
            Object.values(err.message).forEach((m: any) => {
              const msg = getFarsiError(m);
              if(msg){
                toast.error(getFarsiError(m));
              }
            });
            return;
          }
          toast.error(err.message);
        }
        else {
          toast.error('خطایی رخ داده است');
        }
      }
    }
  } catch (err: any) {
    if(verbose){
      if(err.message){
        toast.error(err.message);
      } else {
        toast.error('خطایی رخ داده است');
      }
    }
    return null
  }
}

export const deleteTableRow = async(tableName: string, id: number, onDeleted?: (data: any) => void, verbose: boolean=true) => {
  const token =  getToken()
  try{
    const resp = await fetch(`${api_base_url}/${tableName}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}`: ''
      }
    });
    if(resp.ok){
      const data = await resp.json();
      console.info({data});
      if(onDeleted){
        toast.success('حذف با موفقیت انجام شد');
        onDeleted(data);
      } else {
        return data;
      }
    } else if(resp.status === 401) {
      toast.error(getFarsiError('401'));
      // Go to login page
      await sleep(3000);
      window.location.href = '/';
      return [];
    } else {
      if(verbose){
        const err = await resp.json();
        if(err.message){
          if(typeof err.message === 'object') {
            Object.values(err.message).forEach((m: any) => {
              const msg = getFarsiError(m);
              if(msg){
                toast.error(getFarsiError(m));
              }
            });
            return;
          }
          toast.error(err.message);
        }
        else {
          toast.error('خطایی رخ داده است');
        }
      }
    }
  } catch (err: any) {
    if(verbose){
      if(err.message){
        toast.error(err.message);
      } else {
        toast.error('خطایی رخ داده است');
      }
    }
    return null
  }
}
export const updateTableRow = async(tableName: string, id: number, row: any, onUpdated?: (data: any) => void, verbose: boolean=true) => {
  const token =  getToken()
  try{
    const resp = await fetch(`${api_base_url}/${tableName}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}`: ''
      },
      body: JSON.stringify(row)
    });
    if(resp.ok){
      const data = await resp.json();
      console.info({data});
      if(onUpdated){
        onUpdated(data);
      } else {
        return data;
      }
    } else if(resp.status === 401) {
      toast.error(getFarsiError('401'));
      // Go to login page
      await sleep(3000);
      window.location.href = '/';
      return [];
    } else {
      if(verbose){
        const err = await resp.json();
        if(err.message){
          if(typeof err.message === 'object') {
            Object.values(err.message).forEach((m: any) => {
              const msg = getFarsiError(m);
              if(msg){
                toast.error(getFarsiError(m));
              }
            });
            return;
          }
          toast.error(err.message);
        }
        else {
          toast.error('خطایی رخ داده است');
        }
      }
    }
  } catch (err: any) {
    return null
  }
}

