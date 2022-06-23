import path from "path";
import {
  FileSystemPackageReader,
  ValidationFailReason,
  WasmPackageValidator,
} from "..";

jest.setTimeout(200000);

const testWrappersPath = path.join(__dirname, "./wrappers");

const assertValidWrapper = async (wrapperPath: string) => {
  const reader = new FileSystemPackageReader(wrapperPath);

  const validator = new WasmPackageValidator({
    maxSize: 1_000_000,
    maxFileSize: 1_000_000,
    maxModuleSize: 1_000_000,
    maxNumberOfFiles: 1000,
  });

  const result = await validator.validate(reader);

  expect(result.valid).toBeTruthy();
  expect(result.failReason).toEqual(undefined);
};

describe("manfiests", () => {
  it("sanity", async () => {
    await assertValidWrapper(
      path.join(testWrappersPath, "wrapper-size-over-100-kb")
    );
    await assertValidWrapper(
      path.join(testWrappersPath, "file-size-over-100-kb")
    );
    await assertValidWrapper(
      path.join(testWrappersPath, "module-size-over-100-kb")
    );
  });

  it("fails validating a large wrapper", async () => {
    const reader = new FileSystemPackageReader(
      path.join(testWrappersPath, "wrapper-size-over-100-kb")
    );

    const validator = new WasmPackageValidator({
      maxSize: 100_000,
      maxFileSize: 1_000_000,
      maxModuleSize: 1_000_000,
      maxNumberOfFiles: 1000,
    });

    const result = await validator.validate(reader);

    expect(result.valid).toBeFalsy();
    expect(result.failReason).toEqual(ValidationFailReason.WrapperTooLarge);
  });

  it("fails validating a large file", async () => {
    const reader = new FileSystemPackageReader(
      path.join(testWrappersPath, "module-size-over-100-kb")
    );

    const validator = new WasmPackageValidator({
      maxSize: 1_000_000,
      maxFileSize: 100_000,
      maxModuleSize: 1_000_000,
      maxNumberOfFiles: 1000,
    });

    const result = await validator.validate(reader);

    expect(result.valid).toBeFalsy();
    expect(result.failReason).toEqual(ValidationFailReason.FileTooLarge);
  });

  it("fails validating a large module", async () => {
    const reader = new FileSystemPackageReader(
      path.join(testWrappersPath, "module-size-over-100-kb")
    );

    const validator = new WasmPackageValidator({
      maxSize: 1_000_000,
      maxFileSize: 1_000_000,
      maxModuleSize: 100_000,
      maxNumberOfFiles: 1000,
    });

    const result = await validator.validate(reader);

    expect(result.valid).toBeFalsy();
    expect(result.failReason).toEqual(ValidationFailReason.ModuleTooLarge);
  });
});
