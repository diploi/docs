# Diploi Docs 

## Nextra

This is a template for creating documentation with [Nextra](https://nextra.site).

[**Live Demo →**](https://nextra-docs-template.vercel.app)

[![](.github/screenshot.png)](https://nextra-docs-template.vercel.app)

## Quick Start

Click the button to clone this repository and deploy it on Vercel:

[![](https://vercel.com/button)](https://vercel.com/new/clone?s=https%3A%2F%2Fgithub.com%2Fshuding%2Fnextra-docs-template&showOptionalTeamCreation=false)

## Local Development

First, run `pnpm i` to install the dependencies.

Then, run `pnpm dev` to start the development server and visit localhost:3000.

## How to convert mp4=>gif

ffmpeg -i video.mp4 -vf "scale=480:-1,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 output.gif
ffmpeg -i GetStartedTodoApp.mp4 -vf "fps=10,scale=960:-1,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 GetStartedTodoApp.gif

## License

All rights reserved - Nemesys
