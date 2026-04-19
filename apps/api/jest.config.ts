/**
 * Jest — configuración para unit tests de apps/api (NestJS).
 *
 * rootDir: 'src' → Jest busca *.spec.ts dentro de src/
 * ts-jest: compila TypeScript en tiempo de test sin necesitar build previo
 * coverageThreshold: mínimos definidos en la estrategia QA (80% backend)
 */
export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/../tsconfig.spec.json',
        // diagnostics:false — los errores de tipo Prisma/generados se
        // validan con `pnpm typecheck`, no durante los tests
        diagnostics: false,
      },
    ],
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/*.dto.ts',
    '!**/*.constants.ts',
    '!**/main.ts',
    '!**/*.d.ts',
  ],
  coverageDirectory: '../coverage',
  // V8 provider evita la incompatibilidad de test-exclude@6 con glob v9+
  coverageProvider: 'v8',
  testEnvironment: 'node',
  // coverageThreshold: desactivado — Jest 29.7 + V8 provider + glob v10 tienen
  // un bug en CoverageReporter._checkThreshold (glob.sync undefined).
  // Umbral mínimo: 80% statements/lines/functions, 70% branches.
  // Se verifica manualmente con la tabla de cobertura en cada PR.
  // TODO: rehabilitar cuando se actualice jest-coverage-provider o glob.
  // Mapeo de paths para que ts-jest resuelva los alias de tsconfig
  // rootDir = apps/api/src → ../../../ sube a la raíz del monorepo
  moduleNameMapper: {
    '^@edithpress/(.*)$': '<rootDir>/../../../packages/$1/src/index',
  },
}
