
# 🎧 Eternity Ready Podcast Page – Source Code

## 🚧 Setup (Development)

After cloning the repository, follow these steps to run the project locally:

1. **Install Node.js dependencies:**

```bash
npm install
```

2. **Create a `.env.local` file in the root directory and add the following environment variables:**

```env
NEXT_PUBLIC_API_URL=YOUR_BACKEND_URL
REVALIDATION_TOKEN=YOUR_REVALIDATION_TOKEN
```

> Example:
> - `NEXT_PUBLIC_API_URL`: URL of the API that will be used (e.g.,`https://keystone.eternityready.com`).
> - `REVALIDATION_TOKEN`: Token to trigger static regeneration of the backend (if used).

Replace the values above with your actual backend credentials.

3. **Run the application in development mode:**

```bash
npm run dev
```

The app will be available at: [http://localhost:3000](http://localhost:3000)

---

## 🚀 Deploying to Production

When your app is ready for production:

1. **Build the application:**

```bash
npm run build
```

2. **Start the production server:**

```bash
npm run start
```

The application will run on the port shown in the terminal.  
Example: [http://localhost:3002](http://localhost:3002)

> ℹ️ By default, the project runs on http://localhost:3001

---

## 🔁 Keep Application Online (PM2)

To keep the app running in the background, use [PM2](https://pm2.keymetrics.io/):

1. **Start the app with PM2:**

```bash
pm2 start npm --name "eternity-ready-app" -- start
```

2. **Save the PM2 process list:**

```bash
pm2 save
```

> This ensures the app stays online while the server is on.

---

## 🔄 Workflow to Update the Production App

When updating the app in production, follow this flow:

1. **Rebuild the application with the latest changes:**

```bash
npm run build
```

2. **Reload the PM2 process:**

```bash
pm2 reload eternity-ready-app
```

> You can also use the process ID shown in `pm2 list` if needed.
