import { InjectionToken } from "@angular/core";
import { TypedPocketBase } from "@models";

export const PB = new InjectionToken<TypedPocketBase>('PocketBase client');
import { environment } from '../environments/environment';

export const API_URL = environment.apiUrl;

