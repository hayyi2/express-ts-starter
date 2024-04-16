# Express Ts Starter

Express + TypeScript minimal starter for building web api.

Studi Kasus: Pengelolaan note/catatan pribadi. Pengguna dapat mendaftar/masuk ke dalam aplikasi dan dapat mengelola catatan miliknya sendiri. Terdapat access role yang dapat mengelola user.

## Getting Started

```
git clone https://github.com/hayyi2/express-ts-starter.git new-project
cd new-project
npm install
npm run dev
```

## Getting Done

- [x] Setup express, typescript, and eslint
- [x] Setup eslint and prettier
- [x] Implement hello endpoint
- [x] Setup database (schema & seed)
- [x] Implement auth (login, logout, refresh token, register, profile)
- [x] Implement manage user (CRUD)
- [x] Implement manage note (CRUD)
- [x] Refactor code & structure folder
- [ ] Setup testing

generate jwt secret
```sh
openssl rand -base64 32
```

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/hayyi2/express-ts-starter/blob/main/LICENSE) file for details. 
