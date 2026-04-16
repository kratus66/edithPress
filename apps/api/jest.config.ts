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
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  // Mapeo de paths para que ts-jest resuelva los alias de tsconfig
  // rootDir = apps/api/src → ../../../ sube a la raíz del monorepo
  moduleNameMapper: {
    '^@edithpress/(.*)$': '<rootDir>/../../../packages/$1/src/index',
  },
}
