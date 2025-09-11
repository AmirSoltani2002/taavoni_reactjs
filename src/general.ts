import Cookies from "js-cookie";
import { api_base_url } from "./config";

export const getToken = () => {
  return Cookies.get('token') || '';
}

export function postData<Type>(url: string, data: Type, token?: string) {
  // Default options are marked with *
  return fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    // mode: 'cors', // no-cors, *cors, same-origin
    // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}`: ''
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  })
  .then(response => response.json()) // parses JSON response into native JavaScript objects
}

export function postForm(url: string, data: FormData) {
  return fetch(url, {
    method: 'POST',
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: data
  })
  .then(response => response.json()) // parses JSON response into native JavaScript objects
}

export const getTable = async(tableName: string, onGot?: (data: any) => void) => {
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
      console.info({data});
      if(onGot){
        onGot(data);
      } else {
        return data;
      }
    }
  } catch (err: any) {
    return []
  }
  
}

