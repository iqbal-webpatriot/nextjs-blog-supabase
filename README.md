
# NEXT JS BLOG APPLICATION
This application has been built in Nextjs and Tailwind CSS. In this user can create their account and start writing their first blog easily.

For backend , We have used Supabase which is a backend as a service platform powered with Postgresql database.

## Features 
- User can create their account with a valid email address. 
- User can req for password change 
- User can choose category and tags for the post 
- User can like/dislike post
- User can comment on post 
- User can modify/delete their written post
- User can filter/search blog post according to their interest
- User can delete their written post 

## Project Installation 

First clone the project using below command

```bash
  git clone https://github.com/iqbal-webpatriot/nextjs-blog-supabase
```

Navigate to the root directory and run below command
```bash
 1. cd nextjs-blog-supabase 
 2 . npm install 
```
### Example .env 
```bash
// supabase client credentials, you have to  visit on supabase.com to generate below credentials
NEXT_PUBLIC_SUPABASE_ANON_KEY= your generated supabase anon ky 
NEXT_PUBLIC_SUPABASE_URL= your supabase url 

```
To run project in local, run below command

```bash
 npm run dev  

```
Now hit on http://localhost:3000  to load the app  in the browser.

### Project Requirement 
```
1.You must have installed Nodejs LTS version in your system .Follow the below link for installation steps
```
Nodejs doc- https://nodejs.org/en/download

## Tech Stack
**Client:** Nextjs,Tailwind CSS,Redux,React query etc.

**Server:** Supabase CMS.




