# Contributing

👍 🎉 Thanks for taking the time to contribute! 🎉 👍

Any contributions to this repository are most welcome. If you are planning to contribute, please take time to read this file and follow the guidelines.

## How to

#### There are quite a few ways to contribute, but following is the recommended approach.

`1. Fork this repository`

When you fork this repository you will have a personal copy of the repository where you will have complete access to edit any file. 
Edit the files you want to and commit the changes.

`2. Make a Pull request`

When you are done editing the file(s) and have commited the changes to the fork, you can now make a pull request to this repository.
You will see a Pull request option alongside compare just above the Latest commit message in your fork. 
Please beaware making a pull request to your own repository and making a pull request to this repository are two different things.
You need to click on the `Pull request button` and not the `Pull requests tab`. 

`3. Wait for the changes to get approved`

After making a Pull request you will see your pull request listed in the `Pull requests section` in the original repository.
Your changes will be reviewed and once the changes are approved they will be merged and hence will get applied to the original repository.
You might be asked to improve or make further changes, if the the commits you made could not be approved for some reason. In that case, you will need to edit the files again. 
Please note that, you do not have to make another pull request, just make the changes you are supposed to in the fork and it will get reflected in the already made pull request.


## Adding translation

This application aims to be available in multiple (as many as we can) languages. 
The task could have been achieved by using a translation tool, but in order to maintain accuracy and context, this repository provides an easy way for the contributors native to different languges to add their language to the application.

### Adding/Updating a language

To add or update a language, follow the `Step 1` of  How to section above. 
Once you have your fork ready, you can edit the required files.  

#### Adding new language 

`1. Edit meta.json file`

You will find a meta.json file inside `locale` folder in your copy of repository. 
The file contains language names and corresponding file name which has the actual translation data. In order to add a new language you simply have to add another field (key/value pair) to the file.

Example:

```javascript
{
  "Italian"       : "it.json",
  "Español"       : "es.json", 
  "LANGUAGE_NAME" : "LANGUAGE_SHORTNAME.json"
}
```

#### Note: 
LANGUAGE_NAME is the name of the language that will be displayed in the application and LANGUAGE_SHORTNAME is the shortname of the language and it will also be the name of the file that will contain the translation. 
Please use appropriate shortnames (ISO 639-1 Code) and try not to use more than two alphabets to maintain consistency. 
Do not add duplicate names, you may add a 3rd alphabet (use ISO 639-2 Code) in LANGUAGE_SHORTNAME to separate it from any existing one. 

There is no `comma ','` after the last pair in the file however there is one before that. 
You would have to add a comma yourself since you will be adding the pair to the end of the file.

Example:
LANGUAGE_NAME = "Dutch" LANGUAGE_SHORTNAME = "nl"

```javascript
{
  "Italian" : "it.json",
  "Español" : "es.json", 
  "Dutch"   : "nl.json"
}
```
#### Reference:
https://www.loc.gov/standards/iso639-2/php/code_list.php
https://www.w3schools.com/tags/ref_language_codes.asp

`2. Create a new file "LANGUAGE_SHORTNAME.json"`

Now that you have added the new language name and its corresponding shortname to the `meta.json` file, Next step will be to create the LANGUAGE_SHORTNAME.json file inside the `locale` folder.
You will also find `template.json` file inside the same `locale` folder, just copy the contents of the template file and put them inside the LANGUAGE_SHORTNAME.json file.

You should have something like this inside your LANGUAGE_SHORTNAME.json file.
```javascript
{
  "Udemy Login": "",
  "Email": "",
  "Password": "",
  "Login": "",
  "Type Username/Password": "",
  "Incorrect Username/Password": "",
  "Logging in": "",
  "Loading Courses": "",
  "You have not enrolled in any course": "",
  "Getting Info": "",
  "Courses": ""
}
```
Notice that you are aleady given the words that you need to add translation for. Just add the translation inside the empty quotes given next to each English word.
Please do not add any new words as the words given are the only words that the app will look for.

`3. Commit your changes and make a Pull request`

Now that you have added the translation file, you can commit the changes and make a Pull request. (Follow Step 2 of How to Section)

#### Updating existing translation.

If you want to update an existing translation whether you are the one who created the translation file or not, follow the steps:

##### Updating the LANGUAGE_NAME or LANGUAGE_SHORTNAME

`1. Edit meta.json file` 

Edit meta.json file and update the LANGUAGE_NAME or LANGUAGE_SHORTNAME.

Beaware that any change in LANGUAGE_SHORTNAME might also require to rename the actual file in the `locale` folder.

`2. Commit changes and make Pull request`
Follow Step 2 of How to Section


##### Updating the translation

You may want to update a translation file if you notice something is not correctly translated or a translation is missing either because it has missing value of the word was not added at all possibly because the `contributor` didn't add it or the `template.json` file was updated

`1. Edit the translation file (LANGUAGE_SHORTNAME.json)` 

Make the changes you want to. Do not add a word that is not present in template.json file. If you see a word that is not present in template.json file, you can remove it.

`2. Commit changes and make Pull request`

Follow Step 2 of How to Section


### Note: 
Please do not use any translation tools as it would defeat the purpose of the contribution. 
