import { ProjectConfig, Project } from ".";
import {
  loadPluginManifest,
  PluginManifestLanguage,
  pluginManifestLanguages,
  isPluginManifestLanguage,
  pluginManifestLanguageToBindLanguage,
  resetDir,
} from "..";

import { PluginManifest } from "@web3api/core-js";
import { bindSchema, BindOutput, BindOptions } from "@web3api/schema-bind";
import { ComposerOutput } from "@web3api/schema-compose";
import { TypeInfo } from "@web3api/schema-parse";
import path from "path";

export interface PluginProjectConfig extends ProjectConfig {
  pluginManifestPath: string;
}

export class PluginProject extends Project<PluginManifest> {
  private _pluginManifest: PluginManifest | undefined;

  public static cacheLayout = {
    root: "plugin",
  };

  constructor(protected _config: PluginProjectConfig) {
    super(_config, {
      rootDir: _config.rootDir,
      subDir: PluginProject.cacheLayout.root,
    });
  }

  /// Project Base Methods

  public reset(): void {
    this._pluginManifest = undefined;
    this._cache.resetCache();
  }

  public async validate(): Promise<void> {
    const manifest = await this.getManifest();

    // Validate language
    Project.validateManifestLanguage(
      manifest.language,
      pluginManifestLanguages,
      isPluginManifestLanguage
    );
  }

  /// Manifest (web3api.plugin.yaml)

  public async getName(): Promise<string> {
    return (await this.getManifest()).name;
  }

  public async getManifest(): Promise<PluginManifest> {
    if (!this._pluginManifest) {
      this._pluginManifest = await loadPluginManifest(
        this.getManifestPath(),
        this.quiet
      );
    }

    return Promise.resolve(this._pluginManifest);
  }

  public getManifestDir(): string {
    return path.dirname(this._config.pluginManifestPath);
  }

  public getManifestPath(): string {
    return this._config.pluginManifestPath;
  }

  public async getManifestLanguage(): Promise<PluginManifestLanguage> {
    const language = (await this.getManifest()).language;

    Project.validateManifestLanguage(
      language,
      pluginManifestLanguages,
      isPluginManifestLanguage
    );

    return language as PluginManifestLanguage;
  }

  /// Schema

  public async getSchemaNamedPath(): Promise<string> {
    const manifest = await this.getManifest();
    const dir = this.getManifestDir();
    return path.join(dir, manifest.schema);
  }

  public async getImportRedirects(): Promise<
    {
      uri: string;
      schema: string;
    }[]
  > {
    const manifest = await this.getManifest();
    return manifest.import_redirects || [];
  }

  public async generateSchemaBindings(
    composerOutput: ComposerOutput,
    generationSubPath?: string
  ): Promise<BindOutput> {
    const manifest = await this.getManifest();
    const module = manifest.module as string;
    const moduleDirectory = this._getGenerationDirectory(
      module,
      generationSubPath
    );

    // Clean the code generation
    resetDir(moduleDirectory);
    const bindLanguage = pluginManifestLanguageToBindLanguage(
      await this.getManifestLanguage()
    );

    const options: BindOptions = {
      projectName: manifest.name,
      typeInfo: composerOutput.typeInfo as TypeInfo,
      schema: composerOutput.schema as string,
      outputDirAbs: moduleDirectory,
      bindLanguage,
    };

    return bindSchema(options);
  }

  private _getGenerationDirectory(
    entryPoint: string,
    generationSubPath = "w3"
  ): string {
    const absolute = path.isAbsolute(entryPoint)
      ? entryPoint
      : path.join(this.getManifestDir(), entryPoint);
    return path.join(path.dirname(absolute), generationSubPath);
  }
}
