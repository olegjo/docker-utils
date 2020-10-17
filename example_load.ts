import * as Docker from "./src";
import YAML from "yamljs";
import { composeFile } from "./example";


const composeFileName = "/workspaces/docker-utils/docker-compose.yml";
composeFile.save(composeFileName);

const loaded = YAML.load(composeFileName);
const created = Docker.Compose.ComposeFile.fromYaml(composeFileName);

console.log("LOADED:")
console.log(YAML.stringify(loaded, 20), "\n\n");
console.log("CREATED")
console.log(YAML.stringify(YAML.parse(created.toYaml()), 20));
