export type ListProps<T> = {
  data: T[];
};

export default function List<T>(props: ListProps<T>) {
  console.log(props.data);
  return <ul></ul>;
}
