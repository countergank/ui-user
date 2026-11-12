import { fireEvent } from "@testing-library/react";

/**
 * @param input - the file input element under test.
 * @param file - the file the user is simulated to have selected.
 * @returns Nothing; React receives the selection through the `change` event.
 *
 * `userEvent.upload` leaves `input.files` empty under the jsdom 25 + user-event 14
 * combination, so tests drive file inputs the way the testing library documents:
 * a `change` event whose target carries the selected files.
 */
export function selectFile(input: Element, file: File): void {
  fireEvent.change(input, { target: { files: [file] } });
}
