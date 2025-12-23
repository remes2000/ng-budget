import { InjectionToken } from "@angular/core";
import { TypedPocketBase } from "@models";

export const PB = new InjectionToken<TypedPocketBase>('PocketBase client');
export const API_URL = 'http://127.0.0.1:8090';

