import Cookies from "js-cookie";
import { api_base_url } from "./config";
import { toast } from "sonner";

export function faToEn(input: string | number): string {
  return String(input).replace(/[\u06F0-\u06F9]/g, d =>
    String(d.charCodeAt(0) - 0x06F0)
  );
}

export const getToken = () => {
  return Cookies.get('tokenut') || '';
}

const getFarsiError = (err: string) => {
  const Errors: {
    [k: string]: string
  } = {
    '401': 'توکن شما منقضی شده است. لطفا دوباره وارد شوید',
    '409': 'اطلاعات تکراری است و قابل ثبت نمی‌باشد',
    'incorrect password': 'رمز عبور اشتباه است',
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

// Helper function to fix double-encoded UTF-8 file names
// This happens when UTF-8 bytes are incorrectly interpreted as ISO-8859-1/Latin-1
export const fixDoubleEncodedFileName = (fileName: string): string => {
  try {
    // Check if the string contains mojibake (garbled characters) that suggest double encoding
    // Common pattern: UTF-8 Persian/Arabic bytes interpreted as Latin-1
    // Example: "Ù¾Ø±ÙØ§ÙÙ" should be "پروانه"
    
    // Try to detect if this is a double-encoded UTF-8 string
    // We'll attempt to fix it by:
    // 1. Encoding the string as Latin-1 (ISO-8859-1) to get the original bytes
    // 2. Decoding those bytes as UTF-8
    
    // Use TextEncoder/TextDecoder API for proper encoding conversion
    // First, encode the string as if it were Latin-1 to get the original bytes
    const latin1Bytes = new Uint8Array(fileName.length);
    for (let i = 0; i < fileName.length; i++) {
      latin1Bytes[i] = fileName.charCodeAt(i);
    }
    
    // Now decode those bytes as UTF-8
    const decoder = new TextDecoder('utf-8');
    const fixed = decoder.decode(latin1Bytes);
    
    // Check if the fixed string contains valid Persian/Arabic characters
    // If it does, it's likely we fixed the encoding
    const persianArabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    if (persianArabicRegex.test(fixed)) {
      return fixed;
    }
    
    // If no Persian/Arabic characters found, return original
    return fileName;
  } catch (error) {
    // If conversion fails, return original
    return fileName;
  }
};

// File upload function
export const uploadFile = async (
  tableName: string, 
  file: File, 
  options?: {titleName: string; titleValue: string}[], 
  userId?: number, 
  verbose: boolean = true
): Promise<string | undefined> => {
  const token = getToken();
  if(!userId){return 'no user';}
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', `${userId}`);
    options?.forEach(x => {
      if(x?.titleName) {
        formData.append(x.titleName, x.titleValue || '');
      }
    })
    
    const response = await fetch(`${api_base_url}/${tableName}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
        // Note: Don't set Content-Type header for FormData, browser will set it automatically with boundary
      },
      body: formData
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.url || data.filename || data.path;
    } else if(response.status === 409) {
      toast.error(getFarsiError('409'))
    } else {
      if(verbose){
        const err = await response.json();
        if(err.message){
          const errors = typeof err.message === 'object' ? err.message : [err.message]
          Object.values(errors).forEach((m: any) => {
            const msg = getFarsiError(m);
            if(msg){
              toast.error(getFarsiError(m));
            }
          });
          return;
        }
        else {
          toast.error('خطایی رخ داده است');
        }
      }
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    toast.error('خطا در آپلود فایل');
    return;
  }
};

// Multiple files upload
export const uploadMultipleFiles = async (files: File[], endpoint: string = 'upload/multiple'): Promise<string[]> => {
  const token = getToken();
  
  try {
    const formData = new FormData();
  files.forEach((file) => {
      formData.append(`files`, file);
    });
    
    const response = await fetch(`${api_base_url}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: formData
    });
    
    if (response.ok) {
      const data = await response.json();
      // Usually returns { files: [{ url: '...' }, { url: '...' }] }
      return data.files?.map((f: any) => f.url || f.filename || f.path) || [];
    } else {
      const err = await response.json();
      toast.error(err.message || 'خطا در آپلود فایل‌ها');
      return [];
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    toast.error('خطا در آپلود فایل‌ها');
    return [];
  }
};

// Upload project document to project-docs endpoint
export const uploadProjectDoc = async (
  file: File,
  projectId: number,
  detail?: string,
  verbose: boolean = true
): Promise<any> => {
  const token = getToken();
  console.log('uploadProjectDoc', {file, projectId, detail});
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', `${projectId}`);
    if (detail) {
      formData.append('detail', detail);
    }
    console.log('formData', formData);
    const response = await fetch(`${api_base_url}/project-docs`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
        // Note: Don't set Content-Type header for FormData, browser will set it automatically with boundary
      },
      body: formData
    });
    
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      if (verbose) {
        const err = await response.json();
        if (err.message) {
          const errors = typeof err.message === 'object' ? err.message : [err.message];
          Object.values(errors).forEach((m: any) => {
            const msg = getFarsiError(m);
            if (msg) {
              toast.error(getFarsiError(m));
            }
          });
        } else {
          toast.error('خطا در آپلود سند پروژه');
        }
      }
      return null;
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    if (verbose) {
      toast.error('خطا در آپلود سند پروژه');
    }
    return null;
  }
};
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
      const error = { error: getFarsiError('401'), status: 401 };
      if(verbose){
        toast.error(getFarsiError('401'));
      }
      // Go to login page
      await sleep(3000);
      window.location.href = '/';
      if(onGot){
        onGot({error});
      } else {
        return {error};
      }
    } else {
      const err = await resp.json();
      const error = { error: err.message || 'خطایی رخ داده است', status: resp.status };
      if(verbose){
        if(err.message){
          const errors = typeof err.message === 'object' ? err.message : [err.message]
          Object.values(errors).forEach((m: any) => {
            const msg = getFarsiError(m);
            if(msg){
              toast.error(getFarsiError(m));
            }
          });
        }
        else {
          toast.error('خطایی رخ داده است');
        }
      }
      if(onGot){
        onGot({error});
      } else {
        return {error};
      }
    }
  } catch (err: any) {
    const error = { error: err.message || 'خطایی رخ داده است', status: 0 };
    if(verbose){
      if(err.message){
        toast.error(err.message);
      } else {
        toast.error('خطایی رخ داده است');
      }
    }
    if(onGot){
      onGot({error});
    } else {
      return {error};
    }
  } 
}

export const postTable = async(tableName: string, row: any, onPosted?: (data: any) => void, tokenRequired:boolean=true, verbose: boolean=true) => {
  const token =  getToken()
  try{
    const resp = await fetch(`${api_base_url}/${tableName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': (tokenRequired) ? `Bearer ${token}`: ''
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
    } else if(resp.status === 409) {
      toast.error(getFarsiError('409'))
    } else {
      if(verbose){
        const err = await resp.json();
        if(err.message){
          const errors = typeof err.message === 'object' ? err.message : [err.message]
          Object.values(errors).forEach((m: any) => {
            const msg = getFarsiError(m);
            if(msg){
              toast.error(getFarsiError(m));
            }
          });
          return;
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
          const errors = typeof err.message === 'object' ? err.message : [err.message]
          Object.values(errors).forEach((m: any) => {
            const msg = getFarsiError(m);
            if(msg){
              toast.error(getFarsiError(m));
            }
          });
          return;
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
// Get download URL for document (for displaying images)
export const getDocumentDownloadUrl = async (fileId: number, type: 'user-doc' | 'project-docs', verbose: boolean = true): Promise<string | undefined> => {
  const token = getToken();
  try {
    const resp = await fetch(`${api_base_url}/${type}/download/${fileId}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    if (resp.ok) {
      const data = await resp.text();
      return data;
    } else if (resp.status === 401) {
      if (verbose) {
        toast.error(getFarsiError('401'));
        await sleep(3000);
        window.location.href = '/';
      }
      return undefined;
    } else {
      if (verbose) {
        const err = await resp.json();
        if (err.message) {
          const errors = typeof err.message === 'object' ? err.message : [err.message];
          Object.values(errors).forEach((m: any) => {
            const msg = getFarsiError(m);
            if (msg) {
              toast.error(getFarsiError(m));
            }
          });
        } else {
          toast.error('خطایی رخ داده است');
        }
      }
      return undefined;
    }
  } catch (err: any) {
    if (verbose) {
      if (err.message) {
        toast.error(err.message);
      } else {
        toast.error('خطایی رخ داده است');
      }
    }
    return undefined;
  }
};

// Get image blob URL for displaying images (returns blob URL that can be used as img src)
export const getImageBlobUrl = async (fileId: number, type: 'user-doc' | 'project-docs', verbose: boolean = false): Promise<string | undefined> => {
  const token = getToken();
  try {
    const resp = await fetch(`${api_base_url}/${type}/download/${fileId}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    if (resp.ok) {
      const blob = await resp.blob();
      return URL.createObjectURL(blob);
    } else if (resp.status === 401) {
      if (verbose) {
        toast.error(getFarsiError('401'));
        await sleep(3000);
        window.location.href = '/';
      }
      return undefined;
    } else {
      if (verbose) {
        const err = await resp.json();
        if (err.message) {
          const errors = typeof err.message === 'object' ? err.message : [err.message];
          Object.values(errors).forEach((m: any) => {
            const msg = getFarsiError(m);
            if (msg) {
              toast.error(getFarsiError(m));
            }
          });
        } else {
          toast.error('خطایی رخ داده است');
        }
      }
      return undefined;
    }
  } catch (err: any) {
    if (verbose) {
      if (err.message) {
        toast.error(err.message);
      } else {
        toast.error('خطایی رخ داده است');
      }
    }
    return undefined;
  }
};

// Download document file by fetching from the download endpoint
export const downloadDocument = async (fileId: number, type: 'user-doc' | 'project-docs', filename?: string, verbose: boolean = true): Promise<void> => {
  const token = getToken();
  try {
    const resp = await fetch(`${api_base_url}/${type}/download/${fileId}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    if (resp.ok) {
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get filename from Content-Disposition header or use provided filename
      const contentDisposition = resp.headers.get('Content-Disposition');
      let downloadFilename = filename || 'document';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          downloadFilename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else if (resp.status === 401) {
      if (verbose) {
        toast.error(getFarsiError('401'));
        await sleep(3000);
        window.location.href = '/';
      }
    } else {
      if (verbose) {
        const err = await resp.json();
        if (err.message) {
          const errors = typeof err.message === 'object' ? err.message : [err.message];
          Object.values(errors).forEach((m: any) => {
            const msg = getFarsiError(m);
            if (msg) {
              toast.error(getFarsiError(m));
            }
          });
        } else {
          toast.error('خطایی رخ داده است');
        }
      }
    }
  } catch (err: any) {
    if (verbose) {
      if (err.message) {
        toast.error(err.message);
      } else {
        toast.error('خطایی رخ داده است');
      }
    }
  }
};

export const updateTableRow = async(tableName: string, id: number | string, row: any, onUpdated?: (data: any) => void, verbose: boolean=true) => {
  const token =  getToken()
  row = {
    ...row,
    id: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    exp: undefined,
    iat: undefined,
  }
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
    } else {
      if(verbose){
        const err = await resp.json();
        if(err.message){
          const errors = typeof err.message === 'object' ? err.message : [err.message]
          Object.values(errors).forEach((m: any) => {
            const msg = getFarsiError(m);
            if(msg){
              toast.error(getFarsiError(m));
            }
          });
          return;
        }
        else {
          toast.error('خطایی رخ داده است');
        }
      }
    }
  } catch (err: any) {
    console.log('API not available, creating mock response for update');
    
    // Create a mock response for demonstration
    const mockResponse = {
      id: id,
      ...row,
      updatedAt: new Date().toISOString()
    };
    
    toast.success('پروژه در حالت نمایشی بروزرسانی شد (API در دسترس نیست)');
    
    if(onUpdated){
      onUpdated(mockResponse);
    }
    return mockResponse;
  }
}

