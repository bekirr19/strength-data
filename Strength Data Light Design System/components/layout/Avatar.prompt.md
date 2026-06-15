Round user chip — photo, initial, or fallback icon.

```jsx
<Avatar src={user.photoURL} name={user.name} size={40} />
<Avatar name="Ahmet" />
<Avatar icon={<User size={20}/>} />
```

Falls back from photo → first initial → icon.
