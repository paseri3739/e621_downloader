# scrape_e621

This script will retrieve the e621 image URLs corresponding to the search query you specify and make them all available for download.

# how to install

```
$ npm install
$ npm install typescript --save-dev #if required
$ npx install playwright #if required
```

to install dependencies. then add ".env" file and edit,

```
USER_NAME="your_user_name"
PASSWORD="your_password"
```

# how to run
modify the "searchQuery" variable in "scrape_e621.ts", then run
```
ts-node scrape_e621.ts
```
the script makes ./img directory.
