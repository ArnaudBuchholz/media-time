# media-time ⌚

This project solves a problem that occurs while transferring medias from one device to another: file timestamps are lost during the copy.
It uses an [exif](https://en.wikipedia.org/wiki/Exif) [parser](https://www.npmjs.com/package/exiftool-vendored) to extract the creation timestamp of the the media and it updates the creation, modification and last access time of the file accordingly.

## Installation

* Clone the project
* `npm install`

## Usage

`node index.js <folder containing media files>`