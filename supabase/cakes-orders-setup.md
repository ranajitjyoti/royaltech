# Cakes order notifications setup

1. In the Supabase SQL Editor, run `src/htmlDesign/supabase-cakes-orders.sql`. It is safe to rerun.
2. From the repository root, log in and link the project:

   ```powershell
   supabase login
   supabase link --project-ref flsfsjtyfrpdbhyauxeg
   supabase functions deploy cakes-orders
   ```

3. Generate a VAPID key pair locally with Node.js:

   ```powershell
   node -e "const {generateKeyPairSync}=require('node:crypto');const pair=generateKeyPairSync('ec',{namedCurve:'prime256v1'});const jwk=pair.publicKey.export({format:'jwk'});console.log('VAPID_PUBLIC_KEY='+Buffer.concat([Buffer.from([4]),Buffer.from(jwk.x,'base64url'),Buffer.from(jwk.y,'base64url')]).toString('base64url'));console.log('VAPID_PRIVATE_KEY='+jwk.d)"
   ```

4. Add the generated values as Supabase secrets (keep the private key secret and out of source control):

   ```powershell
   supabase secrets set VAPID_PUBLIC_KEY="PASTE_PUBLIC_KEY" VAPID_PRIVATE_KEY="PASTE_PRIVATE_KEY" VAPID_SUBJECT="mailto:connect@deeplinkdata.com" --project-ref flsfsjtyfrpdbhyauxeg
   ```

5. Publish the website changes. Each admin should sign in to Cakes Management on each device and select **Enable notifications**, then allow browser notifications. Keep the same VAPID keys; rotating them requires admins to disable and re-enable their subscriptions.

The Edge Function uses Supabase's server-provided service-role secret; do not add a service-role key to browser code. Push delivery requires HTTPS and follows each device's notification and sound settings.
