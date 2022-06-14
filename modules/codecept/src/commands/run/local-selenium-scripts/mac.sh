#!/bin/bash

if [ ! -n `which java` ]; then
  brew install java
fi

mkdir -p bin && cd bin

# Download selenium
selenium="selenium-server-4.2.1.jar"
if [ ! -f "$selenium" ]; then
  wget -q "https://github.com/SeleniumHQ/selenium/releases/download/selenium-4.2.0/$selenium" -O "$selenium"
fi

# Download chromedriver
if [ ! -f "chromedriver" ]; then
  chromeVersion=$(/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --version)
  IFS='.' read -r -a c <<< "${chromeVersion//Google Chrome /}"

  case ${c[0]} in
    "101") fullVersion="101.0.4951.41";;
    "102") fullVersion="102.0.5005.61";;
    "103") fullVersion="103.0.5060.24";;
  esac

  chromedriver="chromedriver_mac64.zip"
  wget -q "https://chromedriver.storage.googleapis.com/$fullVersion/$chromedriver" -O "$chromedriver"
  unzip "$chromedriver"
fi

# Download firefoxdriver
if [ ! -f "geckodriver" ]; then
  wget -q "https://github.com/mozilla/geckodriver/releases/download/v0.31.0/geckodriver-v0.31.0-macos.tar.gz"
  tar -xvzf geckodriver-v0.31.0-macos.tar.gz
fi

java -jar $selenium standalone
