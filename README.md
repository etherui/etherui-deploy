# Description

This CLI tool allows to create Smart contract UI on <a href="https://etherui.net">EtherUI service</a> by Truffle JSON file.

# How to use

For the installation you need to run

```

npm install -g etherui-deploy

```

For the deploying new Smart contract UI you need to have login on service <a href="https://etherui.net">EtherUI </a>.

If you have such credentials already, just go to your folder for Truffle project and run

```

etheruideploy

```

If you will run it a first time then be needed to enter login/password (it will be sent by https with sha256 hashed password)

Also, you must to specify "build" directory, Smart contract name, contract address and this tool will deploy and create new UI by Smart contract ABI.

# Demo

The deployment process via CLI

![CLI](https://i.imgur.com/5j5E6SG.gif)

New web, desktop, mobile UI

![CLI](https://i.imgur.com/mUf7YO1.gif)
