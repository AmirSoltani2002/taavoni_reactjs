import Cookies from "js-cookie";
import { api_base_url } from "./config";
import { toast } from "sonner";

export const getToken = () => {
  return Cookies.get('token') || '';
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export function postData<Type>(endpoint: string, data: Type, tokenRequired: boolean = false) {
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
      toast.error('توکن شما منقضی شده است. لطفا دوباره وارد شوید');
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
              toast.error(m as string);
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
      toast.error('توکن شما منقضی شده است. لطفا دوباره وارد شوید');
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
              toast.error(m as string);
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
        onDeleted(data);
      } else {
        return data;
      }
    } else if(resp.status === 401) {
      toast.error('توکن شما منقضی شده است. لطفا دوباره وارد شوید');
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
              toast.error(m as string);
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
      method: 'PATCH',
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
      toast.error('توکن شما منقضی شده است. لطفا دوباره وارد شوید');
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
              toast.error(m as string);
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

