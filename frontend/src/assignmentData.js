import { at } from "./data";

export const ASSIGNMENTS = [
  { id: "a1", title: "Essay", module: "History of Computing", due: at(12, 12),
    brief: "Question: Was the Manchester Baby more significant than ENIAC? 2,000 words, 6+ academic sources, Harvard referencing. Marking: argument 40%, sources 40%, structure and referencing 20%." },
  { id: "a2", title: "Coursework: sorting algorithms", module: "COMP11212 Algorithms", due: at(18, 12),
    brief: "Implement merge sort and quicksort in Python. Time them on random, sorted and reverse-sorted inputs from 1,000 to 100,000 items. Write a 1,500-word report with Big-O analysis and two graphs. Marking: code 30%, experiments 30%, report 40%." },
];
