"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const http_1 = __importDefault(require("http"));
const http_errors_1 = __importDefault(require("http-errors"));
const package_json_1 = require("../package.json");
const agentsRouter_1 = __importDefault(require("./api/agentsRouter"));
const lockRouter_1 = __importDefault(require("./api/lockRouter"));
const app = (0, express_1.default)();
const router = express_1.default.Router();
const routes = [
    { path: "/", viewName: "index", title: "Home" },
    { path: "/pageTwo", viewName: "pageTwo", title: "Page 2" },
    { path: "/pageThree", viewName: "pageThree", title: "Page 3" },
    { path: "/pageFour", viewName: "pageFour", title: "Page 4" }
];
routes.forEach(({ path, viewName, title }) => {
    router.get(path, (_req, res) => res.render(viewName, { title }));
});
app.use("/", agentsRouter_1.default);
app.use("/", lockRouter_1.default);
app.set("port", package_json_1.expressPort);
app.set("views", path_1.default.join(__dirname, "..", "views"));
app.set("view engine", "ejs");
app.use((0, morgan_1.default)("dev"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, "..", "public")));
app.use("/", router);
app.use((_req, _res, next) => next((0, http_errors_1.default)(404)));
app.use((err, req, res, _next) => {
    res.locals.title = "error";
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500).render("error");
});
const server = http_1.default.createServer(app);
function handleServerError(error) {
    if (error.syscall !== "listen")
        throw error;
    const bind = typeof package_json_1.expressPort === "string" ? `Pipe ${package_json_1.expressPort}` : `Port ${package_json_1.expressPort}`;
    switch (error.code) {
        case "EACCES":
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}
function shutdown() {
    console.log("Shutting down Express server...");
    server.close();
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
server.listen(package_json_1.expressPort);
server.on("error", handleServerError);
server.on("listening", () => console.log(`Listening on: ${package_json_1.expressPort}`));
server.on("close", () => console.log("Express server closed."));
