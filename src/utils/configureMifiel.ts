import { Config } from '@mifiel/api-client-auth';

export default function () {
  Config.setTokens({
    appId: process.env.MIFIEL_APP_ID as string,
    appSecret: process.env.MIFIEL_APP_SECRET as string,
    env: process.env.MIFIEL_ENV as
      | 'production'
      | 'sandbox'
      | 'staging'
      | undefined,
  });
}
