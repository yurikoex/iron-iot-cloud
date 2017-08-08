#!/bin/bash

echo 'installing node stable'
nvm install stable

echo 'setting nvm default to stable'
nvm alias default stable

echo 'setting nvm to use stable'
nvm use stable
