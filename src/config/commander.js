import { Command } from "commander";

// Se obtienen los argumentos de la línea de comandos
const program = new Command();

program.option("--mode <mode>", "Modo de ejecución", "development");

program.parse();

export default program;
