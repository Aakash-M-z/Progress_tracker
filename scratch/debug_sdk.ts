import * as SibApiV3Sdk from 'sib-api-v3-sdk';
console.log('SibApiV3Sdk keys:', Object.keys(SibApiV3Sdk));
if ((SibApiV3Sdk as any).default) {
    console.log('SibApiV3Sdk.default keys:', Object.keys((SibApiV3Sdk as any).default));
}
