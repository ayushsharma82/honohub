import { BlockWrapper, quackFields } from "@duck-form/fields";
import { Button, Skeleton, Toast } from "@rafty/ui";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Blueprint, DuckField, DuckForm } from "duck-form";
import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { ZodError } from "zod";
import { PageHeader, PageTitle } from "../components/Header";
import { useServer } from "../providers";
import type { CollectionType } from "../types";
import { getSingularLabel } from "../utils";

enum DocumentSubmitType {
  SAVE_AND_ADD_ANOTHER = 1,
  SAVE = 2,
}

enum FormType {
  CREATE = 1,
  EDIT = 2,
}

const SUBMIT_BUTTON_KEY = "_submit_btn";

export type DocumentPage = Omit<CollectionType, "columns">;

export function DocumentPage({ fields, slug, label }: DocumentPage) {
  const { id } = useParams();
  const { endpoint } = useServer();
  const formType = id === "create" ? FormType.CREATE : FormType.EDIT;

  const { data, isLoading } = useQuery({
    queryKey: ["collections", slug, id],
    queryFn: () =>
      endpoint.get(`collections/${slug}/${id}`).then((res) => res.data),
    enabled: formType === FormType.EDIT,
  });

  const methods = useForm();

  const { handleSubmit, reset, setValue, setError } = methods;

  const names = useMemo(
    () => Object.fromEntries(fields.map(({ name }) => [name, true])),
    [fields],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (data) {
      const entries = Object.entries(data).filter(([name]) => names[name]);
      reset(Object.fromEntries(entries));
    }
  }, [data]);

  const navigate = useNavigate();

  return (
    <>
      <PageHeader>
        <PageTitle>
          {formType === FormType.CREATE ? "Create" : "Edit"}{" "}
          {getSingularLabel(label)}
        </PageTitle>
      </PageHeader>
      <FormProvider {...methods}>
        <DuckForm
          components={quackFields}
          generateId={(_, props) => (props ? String(props.id) : undefined)}
        >
          <form
            onSubmit={handleSubmit(async (values) => {
              const document_submit_type_value = values[SUBMIT_BUTTON_KEY];
              values[SUBMIT_BUTTON_KEY] = undefined;

              try {
                if (formType === FormType.CREATE)
                  await endpoint.post(`/collections/${slug}`, values);
                else await endpoint.put(`/collections/${slug}/${id}`, values);

                if (
                  document_submit_type_value ===
                  DocumentSubmitType.SAVE_AND_ADD_ANOTHER
                )
                  reset();
                else navigate(`/collections/${slug}`);

                toast.custom(({ visible }) => (
                  <Toast
                    severity="success"
                    title="Document added successfully"
                    visible={visible}
                  />
                ));
              } catch (err) {
                console.error(err);

                if (isAxiosError(err)) {
                  const errorResponse = err.response?.data.error;

                  if (
                    errorResponse &&
                    typeof errorResponse === "object" &&
                    "name" in errorResponse &&
                    "issues" in errorResponse &&
                    errorResponse.name === "ZodError" &&
                    Array.isArray(errorResponse.issues)
                  ) {
                    const zodError = ZodError.create(errorResponse.issues);

                    for (const issue of zodError.issues) {
                      const name = issue.path.join(".");
                      setError(name, {
                        type: issue.code,
                        message: issue.message,
                      });
                    }
                  } else
                    toast.custom(({ visible }) => (
                      <Toast
                        severity="error"
                        title={`${err.response?.status} ${err.code}`}
                        message={err.response?.statusText}
                        visible={visible}
                      />
                    ));
                } else
                  toast.custom(({ visible }) => (
                    <Toast
                      severity="error"
                      title="Something went wrong!"
                      visible={visible}
                    />
                  ));
              }
            })}
            className="space-y-4"
          >
            <div className="space-y-3 max-w-4xl py-4 mx-auto">
              {isLoading ? (
                Array.from({ length: 8 }, (_, i) => (
                  <Skeleton key={`${i}-${"loading"}`} className="w-full h-10" />
                ))
              ) : (
                <Blueprint wrapper={BlockWrapper}>
                  {fields.map((props) => (
                    <DuckField key={props.name} id={props.name} {...props} />
                  ))}
                </Blueprint>
              )}
            </div>
            <div className="flex justify-end gap-4 p-2 bg-secondary-100 dark:bg-secondary-900 rounded-md">
              <Button
                type="submit"
                variant="ghost"
                colorScheme="primary"
                onClick={() =>
                  setValue(
                    SUBMIT_BUTTON_KEY,
                    DocumentSubmitType.SAVE_AND_ADD_ANOTHER,
                  )
                }
              >
                Save and add another
              </Button>
              <Button
                type="submit"
                colorScheme="primary"
                onClick={() =>
                  setValue(SUBMIT_BUTTON_KEY, DocumentSubmitType.SAVE)
                }
              >
                Submit
              </Button>
            </div>
          </form>
        </DuckForm>
      </FormProvider>
    </>
  );
}
