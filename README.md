# Hizashi IRC Bot

Hizashi is a modular IRC bot that is able to reload services on-the-fly without sacrificing down time. 

### New Features!

  - [2/26/2017] Added a curses based service manager, you can still optionally run Hizashi without it. To use this new manager, use `npm run start`. To run in headless mode, use `npm run start-headless`.

![](https://i.imgur.com/2Tss7Iw.png)

### How Hizashi works

 - A central server is instantiated that services *(i.e., your plugins)* will register to.
 - This central server will connect to IRC and forward nearly all events it receives to every subscribed service.
 - Since the central server is the process connected to IRC, services, which are separate processes, can be killed and reopened as needed without interfering with the IRC connection.
 - Services optionally feed back events to the central server based on the events it receives. For example, an echo service might forward all *PRIVMSG* events it receives back to the central server.

### Installation

Install the dependencies and start Hizashi.

```sh
$ cd hizashi
$ npm install
$ npm run start
```

Don't forget to configure `config.json` and `services/config.json` accordingly!

### Services

Hizashi currently ships with a few services.

| Plugin | README |
| ------ | ------ |
| echo | A basic echo reactor |
| random_name | Grabs a random name from a file |
| image_info | Analyzes images with Google Vision |
| invite_listener | Listens for channel invite requests |
| reddit | Posts specific urls to Reddit |
| wolfram_alpha | Basic math calculations using W-A [WIP] |

License
----
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see http://www.gnu.org/licenses/.
