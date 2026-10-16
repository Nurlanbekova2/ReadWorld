# React + Vite

## Reading tracker Firestore rules

The reading tracker stores data in `readingList`, `dailyLogs`, and `userStats`.
In Firebase Console, add the following matches inside the existing
`match /databases/{database}/documents` block, then publish the rules. Merge
these matches with the current rules; do not replace rules for other
collections.

```text
match /readingList/{entryId} {
  allow read: if request.auth != null
    && resource.data.userId == request.auth.uid;
  allow create: if request.auth != null
    && request.resource.data.userId == request.auth.uid;
  allow update: if request.auth != null
    && resource.data.userId == request.auth.uid
    && request.resource.data.userId == request.auth.uid;
  allow delete: if request.auth != null
    && resource.data.userId == request.auth.uid;
}

match /dailyLogs/{logId} {
  allow read: if request.auth != null
    && resource.data.userId == request.auth.uid;
  allow create: if request.auth != null
    && request.resource.data.userId == request.auth.uid;
  allow update: if request.auth != null
    && resource.data.userId == request.auth.uid
    && request.resource.data.userId == request.auth.uid;
  allow delete: if request.auth != null
    && resource.data.userId == request.auth.uid;
}

match /userStats/{userId} {
  allow read, write: if request.auth != null
    && request.auth.uid == userId;
}
```

Reading-list and daily-log queries must continue to filter by the signed-in
user's `userId`. The tracker page reports permission errors instead of
displaying them as empty lists.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
