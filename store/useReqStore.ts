import { create } from "zustand";

interface Param {
  key: string;
  value: string;
  enabled: boolean;
}

interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

type BodyType = 'none' | 'json' | 'form-data';

interface FormDataField {
  key: string;
  value: string;
  enabled: boolean;
}

interface RequestStore {
  params: Param[];
  setParams: (params: Param[]) => void;
  headers: Header[];
  setHeaders: (headers: Header[]) => void;
  bodyType: BodyType;
  setBodyType: (bodyType: BodyType) => void;
  jsonBody: string;
  setJsonBody: (body: string) => void;
  formDataFields: FormDataField[];
  setFormDataFields: (fields: FormDataField[]) => void;
}

export const useReqStore = create<RequestStore>((set) => ({
  params: [{ key: '', value: '', enabled: true }],
  setParams: (params) => set({ params }),
  
  headers: [{ key: '', value: '', enabled: true }],
  setHeaders: (headers) => set({ headers }),
  
  bodyType: 'none',
  setBodyType: (bodyType) => set({ bodyType }),
  
  jsonBody: '',
  setJsonBody: (jsonBody) => set({ jsonBody }),
  
  formDataFields: [{ key: '', value: '', enabled: true }],
  setFormDataFields: (formDataFields) => set({ formDataFields }),
}));