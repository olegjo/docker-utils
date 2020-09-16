# TypeScript Docker Utility library

## Docker Compose
This library can be used to programatically create a docker-compose file.

Example:
```TypeScript
import * as Docker from "@olegjo/docker-utils";

// Create networks.
const netExternal = new Docker.Compose.Network("net_external", false);

// Create volumes. Volumes of type "volume" are docker volumes. Volumes of type "bind" are bound to the host file system.
const volDatabase = new Docker.Compose.Volume("db_data", "volume", "");
const volConf  = new Docker.Compose.Volume("conf", "bind", "./conf/");

// Set up services.
const dbService = new Docker.Compose.Service("database", "mongodb");
dbService.restart = "unless-stopped";
dbService.networks = [ netExternal ]; // add networks
dbService.addVolume(volDatabase, "/data/db"); // Add volume and set location inside the container

const nginxService = new Docker.Compose.Service("nginx", "nginx");
nginxService.addPort("80", "80");
nginxService.dependsOn = [ dbService ];
nginxService.restart = "unless-stopped";
nginxService.networks = [ netExternal ];
nginxService.addVolume(volConf, "/var/nginx/conf");

// Finally, compile the compose file. 
// The network and volumes sections are automatically added 
// based on their presence in the added services
const composeFile = new Docker.Compose.ComposeFile("2.3");
composeFile.addService(dbService);
composeFile.addService(nginxService);

const compose = composeFile.toYaml();

```
