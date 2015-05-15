HOW-TO
======
This guide is designed to familiarise you with the configuration and running of
this IRC Application Service (AS) and provide a more thorough look at some of
the features of this AS.

Installing
----------
If you haven't already, check out the ``README`` for 
[Quick Start](README.md#quick-start) instructions on how to install the AS.
This project requires ``nodejs`` in order to run, and has been tested on 
``v0.10.25``.
```
$ git clone git@github.com:matrix-org/matrix-appservice-irc.git
$ cd matrix-appservice-irc
$ npm install  # may require sudo if you haven't told npm to install elsewhere
$ npm test  # make sure these pass!
```
Once that is done, you're ready to configure the AS.

Configuring
-----------
A [sample configuration file](config.sample.yaml) ``config.sample.yaml`` is 
provided with relatively "sensible" defaults, but **you will need to modify
it before things will work**. It is worth examining certain options more
closely before running the AS.

Either copy ``config.sample.yaml`` to ``config.yaml`` or create a new file.
By default, the AS will look for ``config.yaml`` in the current working
directory. You can override this by passing ``--config some_file.yaml`` or
``-c some_file.yaml`` when you call ``node app.js``.

### Pointing the AS at the Homeserver
```
+==========================================================================+
| You MUST have access to the homeserver configuration file in order to    |
| register this application service with that homeserver. This typically   |
| means you must be running your own homeserver to register an AS.         |
+==========================================================================+
```
The following options are **REQUIRED** in order to point the AS to the HS and
vice versa:
```yaml
appService:
  # This section contains information about the HS
  homeserver:
    # This url will be used by the AS to perform Client-Server API calls.
    url: "http://localhost:8008"
    # This value will be used when forming user IDs under certain
    # circumstances. This is typically the domain part of the 'url' field
    # above.
    domain: "localhost"
  # This section contains information about the AS
  appservice:
    # This is an arbitrary string: it can be anything you want. It is
    # strongly advised that it is a secure random string. This token
    # grants the AS power over the HS, so a weak token here could
    # compromise the security of the HS.
    token: "some_very_long_string"
    # This is the webhook that the HS will use to send events to.
    url: "http://localhost:3500"
  http:
    # This is the port that the AS should listen on.
    port: 3500
```


### Pointing the AS at your chosen IRC network
You probably already have an IRC network in mind that you want to bridge.
The bare bones **REQUIRED** configuration options are:
```yaml
ircService:
  servers:
    # This is the IRC server url to connect to.
    irc.example.com:
      mappings:
        "#some-channel": ["!someroomid:here"]
```
This would set up a simple mapping from ``#some-channel`` on 
``irc.example.com`` to ``!someroomid:here``, and that's it. Dynamic mappings
are *not* enabled by default.

To allow dynamic mappings:
```yaml
ircService:
  servers:
    irc.example.com:
      dynamicChannels:
        enabled: true
```
This will register a block of aliases which represent all the possible IRC
channels on ``irc.example.com``. To join ``#some-channel`` as a Matrix client,
try to join the room alias ``#irc_irc.example.com_#some-channel:localhost``.
You can now join any channel you like by modifying the alias you join.

### Modifying templates
You may think that aliases like ``#irc_irc.example.com_#some-channel:localhost``
are unwieldy and horrible to type. You may only have one IRC network you plan
to bridge, so having to type out the server address every time is tiring.
Templates exist to fix this. They look like the localparts of various IDs
(user IDs, room aliases) but with the sigil (``@`` or ``#``) still attached.
You can specify an Alias Template which will be used by the AS to form new 
room aliases. For example, to get rid of the server in the alias:
```yaml
ircService:
  servers:
    irc.example.com:
      dynamicChannels:
        enabled: true
        aliasTemplate: "#irc_$CHANNEL"
```
This will shorten the alias to be ``#irc_#some-channel:localhost``.

The concept of templates extends to Nicks and User IDs as well. IRC users 
are created with user IDs like ``@irc.example.com_Alice:localhost`` which are
long and hard to type if you want to send a PM to them. You can shorten this 
to ``@irc_Alice:localhost`` like so:
```yaml
ircService:
  servers:
    irc.example.com:
      matrixClients:
        userTemplate:
          "@irc_$NICK"
```

The following variables are available for templates:

#### Nick Template
NB: These variables are sanitized by removing non-ASCII and invalid nick characters.

| Variable      | Description
| ------------- | -----------
| ``$USERID``   | A real Matrix user's user ID.
| ``$DISPLAY``  | A real Matrix user's display name OR user localpart if they have no display name.
| ``$LOCALPART``| A real Matrix user's user ID localpart (e.g. ``alice`` in ``@alice:home``)

#### Alias Template

| Variable      | Description
| ------------- | -----------
| ``$SERVER``   | An IRC server URL.
| ``$CHANNEL``  | An IRC channel name. Required.

#### User ID Template

| Variable      | Description
| ------------- | -----------
| ``$SERVER``   | An IRC server URL.
| ``$NICK``     | A real IRC user's nick.

Registering
-----------

### Architecture

### Safety checks

Features
--------

### Dynamic bridging

### Private bridging

### Ident

### Statsd

### Logging

Contributing
------------