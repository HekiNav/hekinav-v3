
import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://api.digitransit.fi/routing/v2/finland/gtfs/v1/?digitransit-subscription-key=bbc7a56df1674c59822889b1bc84e7ad",
  documents: ["./app/**/*.{ts,tsx}"],
  ignoreNoDocuments: true,
  generates: {
    "./app/lib/__generated__/graphql.ts": {
      plugins: ["typescript-operations"],
      config: {
        generateOperationTypes: false,
      },
    },
    "./app/": {
      preset: "near-operation-file",
      plugins: ["typescript-operations", "typed-document-node"],
      config: {
        importSchemaTypesFrom: "./app/lib/__generated__/graphql.ts",
        // Apollo Client always includes `__typename` fields
        nonOptionalTypename: true,
        // Apollo Client doesn't add the `__typename` field to root types so
        // don't generate a type for the `__typename` for root operation types.
        skipTypeNameForRoot: true,
      },
    },
  },
};

export default config;