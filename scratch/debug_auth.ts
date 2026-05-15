import * as SibApiV3Sdk from 'sib-api-v3-sdk';
const defaultClient = (SibApiV3Sdk as any).default.ApiClient.instance;
console.log('Authentications keys:', Object.keys(defaultClient.authentications));
