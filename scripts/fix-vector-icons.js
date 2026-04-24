const fs = require('fs');
const path = require('path');

const targetPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-vector-icons',
  'lib',
  'NativeRNVectorIcons.ts'
);

const content = `import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getImageForFont(
    fontFamily: string,
    glyph: string,
    fontSize: number,
    color: number
  ): Promise<string>;
  getImageForFontSync(
    fontFamily: string,
    glyph: string,
    fontSize: number,
    color: number
  ): string;
  loadFontWithFileName(
    fontFileName: string,
    extension: string
  ): Promise<void>;
}

export default TurboModuleRegistry.get<Spec>('RNVectorIcons');
`;

try {
  // Ensure the directory exists
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Write the file
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log('Successfully patched react-native-vector-icons for New Architecture codegen.');
} catch (error) {
  console.error('Failed to patch react-native-vector-icons:', error);
}
