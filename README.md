# scrape_e621

This script will retrieve the e621 image URLs corresponding to the search query you specify and make them all available for download. Using playwright allows you to login and remove restrictions on viewing for non-logged-in users.

# how to install

This script using TypeScript for easy and safe development. but you can use compiled scrape_e621.js file.

```
$ npm install
```
then add ".env" file and edit following,

```
USER_NAME="your_user_name"
PASSWORD="your_password"
```

# how to run
run

```
node dist/main.js "your_search_query" number_of_download_limit
```

second argument must be in quotes. third argument is integer.
the script makes ./img directory. All of your downloaded images there.
