# Public demo workspace

Open **Open demo** on the login page. Visitors sign in anonymously and choose a fictional admin, adviser, or intern. Switch account in the demo banner; Exit demo returns to normal sign-in. The workspace switch reloads the app before Firebase initializes.

## Firebase setup

These steps target **c-project-s-demo** only. The application and production rules are separate from the demo rules.

1. In the demo project's Firebase console, enable Authentication → Sign-in method → Anonymous. Add the deployed website domain under Authentication → Settings → Authorized domains.
2. Create the default Firestore database if it does not exist.
3. Deploy the demo rules from the repository root:

   ```powershell
   firebase deploy --only firestore:rules --config firebase.demo.json --project c-project-s-demo
   ```

4. Preview the seed from the repository root:

   ```powershell
   node website/scripts/demo-seed.mjs
   ```

5. Set `FIREBASE_ACCESS_TOKEN` in your shell to a short-lived Google OAuth access token with Firestore write access to the demo project. For an existing authenticated Google Cloud CLI setup, use `$env:FIREBASE_ACCESS_TOKEN = gcloud auth print-access-token`. Do not save the token in source or frontend environment files. Then run:

   ```powershell
   node website/scripts/demo-seed.mjs --project=c-project-s-demo --write
   Remove-Item Env:FIREBASE_ACCESS_TOKEN
   ```

The seed creates **421 documents**: 1 admin, 8 advisers, 24 interns, placement records, shift settings, 288 attendance entries, and 72 accomplishments. There are two advisers and six interns per department. All emails use `example.invalid`; there are no persona Auth accounts or shared passwords. Stable document IDs allow reruns without duplicates. A rerun refreshes sample attendance dates and replaces only the seed documents; visitor records remain untouched.

## Storage and actions

Shared `ojt_*` seed collections are readable by anonymous demo visitors and immutable from browser clients. This database must contain fictional data only. A demo persona is a display and navigation choice, not a privileged Firebase identity.

Visitor changes are stored under `demoSessions/{authUid}/{collection}/{recordId}`. Queries merge the shared seed with that visitor's additions and review copies, then apply the page filters. Switching personas keeps the same visitor's workspace; other visitors cannot read or write it. Registration, profile changes, deletion, passwords, and shift-setting changes are blocked. Attendance review writes private copies and updates the visitor's copy of remaining hours. Those separate writes retain the application's existing non-atomic review behavior.

Attendance uses a placeholder capture and sample coordinates without requesting camera or geolocation access. Accomplishment Camera and Upload buttons select the same placeholder. Rules reject other image values. Visitor text is stored in the demo project: use fictional descriptions. Data persists until the anonymous identity is lost or the demo project is cleaned up; no automatic cleanup is configured.

The hosted `c-project-s-demo` database was seeded and verified on October 31, 2026: 421 records, including two advisers and six interns per department. Anonymous sign-in is enabled. The app connects directly to this hosted project in both development and production. The owner confirmed that the demo Firestore rules have been published.

## Development

From `website`, run `pnpm dev` and open `/login?workspace=demo`. Demo Auth and Firestore connect directly to `c-project-s-demo`; no local Firebase services or Java runtime are needed. Normal sign-in uses the live project configured in `website/.env`.

Anonymous Firebase sign-in supplies the visitor UID. The selected seeded account ID supplies the displayed profile, role, and department. There are no separate Auth accounts for the fictional personas. Visitor changes stay under that anonymous UID as described above.

Run `pnpm build` and `pnpm lint` to check application changes. The seed script is a manual tool for populating or refreshing the hosted demo data; it is not part of app startup.
