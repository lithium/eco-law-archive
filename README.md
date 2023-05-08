# Eco Law Archive

Human readable specifications of Eco civics.


## Overview

### Goal 
Provide a way to document the specific configuration, but still provide a human readable version, of civics: Laws, Elections, Demographics, etc.  This will provide a way for players to accurately recreate them on other Eco servers.  

### Requirements

The civics configuration should be specified in a structured format, but automatically converted to a nice human readable format for reviewing and use by those who will not necessarily commit to this repository but will use it to recreate laws on other servers.

A github repository that stores structure data should be the "primary source of truth" for specifying the civics objects. 

## Implementation

Civics are specified in the JSON in the format used by the [https://github.com/thomasfn/EcoCivicsImportExportMod](EcoCivicsImportExportMod) v0.6.3.

Whenever a pull request or commit occurs a GitHub Action automatically processes the structured .json generating static html for each folder/civic item and output/and publishing it to GitHub Pages.