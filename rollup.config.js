import commonjs from "@rollup/plugin-commonjs";
// import { nodeResolve } from "@rollup/plugin-node-resolve";
// import eslint from '@rbnlffl/rollup-plugin-eslint';
// import { terser } from "rollup-plugin-terser";
import buble from "@rollup/plugin-buble";

const version = process.env.VERSION || require("./package.json").version;
const author = require("./package.json").author;
const license = require("./package.json").license;

const banner = `/*!
      * node-i2djs v${version}
      * (c) ${new Date().getFullYear()} ${author} (narayanaswamy14@gmail.com)
      * @license ${license}
      */`;

export default [
    {
        input: "src/main.js",
        output: [
            {
                banner,
                file: "dist/node-i2d.js",
                format: "cjs",
                name: "i2d",
            },
        ],
        plugins: [
            // nodeResolve(),
            commonjs(),
            // eslint({
            //     fix: true,
            //     throwOnError: true,
            // }),
            buble({
                transforms: { 
                    asyncAwait: false 
                }
            }),
        ],
    }
];
