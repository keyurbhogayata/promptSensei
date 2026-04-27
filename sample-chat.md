## User
Write me a function to fetch user data from an API

## Assistant
Here is the code:
```javascript
async function fetchUserData(userId) {
  const response = await fetch(`https://api.example.com/users/${userId}`);
  return response.json();
}
```

## User
No that's wrong, I got an error. The API uses POST not GET

## Assistant
Sorry about that. Here is the corrected version:
```javascript
async function fetchUserData(userId) {
  const response = await fetch(`https://api.example.com/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  return response.json();
}
```

## User
Now add error handling to the fetchUserData function

## Assistant
Here is the updated function with error handling:
```javascript
async function fetchUserData(userId) {
  const response = await fetch(`https://api.example.com/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
```

## User
Also add TypeScript types

## Assistant
Here is the final TypeScript version:
```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

async function fetchUserData(userId: string): Promise<User> {
  const response = await fetch(`https://api.example.com/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<User>;
}
```
