// Component tests for the shadcn/ui Form composition (COU-271, S3-S5).
//
// The primitive is behavior, not styling: it wires react-hook-form field state into
// accessible ids, `aria-invalid` and `aria-describedby`. The suite drives a real form
// through a real zod resolver instead of asserting on class names.
import { zodResolver } from "@hookform/resolvers/zod";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { z } from "zod";

import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input } from "./input";

const schema = z.object({ email: z.string().email("Enter a valid email") });

type DemoValues = z.infer<typeof schema>;

function DemoForm({ onSubmit }: { onSubmit: (values: DemoValues) => void }) {
  const form = useForm<DemoValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={(event) => {
          void form.handleSubmit(onSubmit)(event);
        }}
        noValidate
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormDescription>We never share it.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Save</button>
      </form>
    </Form>
  );
}

describe("Form", () => {
  it("wires the label, description and control through generated ids", () => {
    render(<DemoForm onSubmit={vi.fn()} />);

    const control = screen.getByLabelText("Email");
    const description = screen.getByText("We never share it.");

    expect(control).toHaveAttribute("aria-describedby", expect.stringContaining(description.id));
    expect(control).not.toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByText("Enter a valid email")).not.toBeInTheDocument();
  });

  it("surfaces the zod validation message and marks the control invalid after submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<DemoForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Save" }));

    const message = await screen.findByText("Enter a valid email");
    const control = screen.getByLabelText("Email");

    expect(onSubmit).not.toHaveBeenCalled();
    expect(control).toHaveAttribute("aria-invalid", "true");
    expect(control).toHaveAttribute("aria-describedby", expect.stringContaining(message.id));
  });

  it("submits the parsed values once the field is valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<DemoForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: "user@example.com" });
  });

  it("renders no inline styles on the elements it authors (S4)", () => {
    const { container } = render(<DemoForm onSubmit={vi.fn()} />);

    expectNoAuthoredInlineStyles(container);
  });

  it("has no axe violations", async () => {
    const { container } = render(<DemoForm onSubmit={vi.fn()} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
