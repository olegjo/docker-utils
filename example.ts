import * as Docker from "./src";

// Create networks.
const netExternal = new Docker.Compose.Network("net_external", false);

// Create volumes. Volumes of type "volume" are docker volumes. Volumes of type "bind" are bound to the host file system.
const volDatabase = new Docker.Compose.Volume("db_data");
const volConf  = new Docker.Compose.Volume("./conf/");

// Set up services.
const dbService = new Docker.Compose.Service("database", "mongodb");
dbService.restart = "unless-stopped";
dbService.networks = [ netExternal ]; // add networks
dbService.addVolume(volDatabase, "/data/db"); // Add volume and set location inside the container

const nginxService = new Docker.Compose.Service("nginx", "nginx");
nginxService.addPort(new Docker.Compose.Port("8080", "8080"));
nginxService.dependsOn = [ dbService ];
nginxService.restart = "unless-stopped";
nginxService.networks = [ netExternal ];
nginxService.addVolume(volConf, "/var/nginx/conf", {readOnly: true, volume: {nocopy: true}, bind: {propagation: "propagation_value"}, tmpfs: {size: 1234}, consistency: "cached"});

// Finally, compile the compose file. 
// The network and volumes sections are automatically added 
// based on their presence in the added services
const composeFile = new Docker.Compose.ComposeFile("2.3");
composeFile.addService(dbService);
composeFile.addService(nginxService);

export { composeFile };
