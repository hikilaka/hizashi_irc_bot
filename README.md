# Hizashi IRC Bot

Hizashi is a modular IRC bot that is able to reload services on-the-fly without sacrificing down time. 

### New Features!

  - [2/26/2017] Added an **awesome** CLI process manager, you can still optionally run Hizashi without it. To use this new manager, use `manager.js`

![](https://i.imgur.com/aPCWHzo.png)

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
$ node manager.js
```

Don't forget to change `config.json`!

### Services

Hizashi currently ships with a few services.

| Plugin | README |
| ------ | ------ |
| echo | A basic echo reactor |
| random_name | Grabs a random name from a file |
| image_info | Analyzes images with Google Vision |

License
----
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see http://www.gnu.org/licenses/.