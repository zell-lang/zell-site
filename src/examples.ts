// Examples for the language section: raw Zell source, checked with `zell check`.
import type { ReactNode } from "react";
import { createElement as h } from "react";

export interface Example {
  id: string;
  title: string;
  hint: ReactNode;
  note: string;
  src: string;
}

const code = (s: string) => h("code", null, s);

export const EXAMPLES: Example[] = [
  {
    id: "errors",
    title: "Errors",
    hint: [code("T!"), ", ", code("?"), " and ", code("try … catch")],
    note: 'Output: ann is 31 · skipped: age of bob: invalid integer: "x". The error says where it came from without a single if err != nil.',
    src: `namespace hello

import io

struct User {
    Name string
    Age  int
}

func parse(line string) User! {
    var parts = strings.Split(line, ":")
    if len(parts) != 2 {
        return error("expected name:age, got " + strconv.Quote(line))
    }
    var age = strings.ToInt(parts[1])?("age of " + parts[0])
    return User{Name: parts[0], Age: age}
}

func main() {
    for line in ["ann:31", "bob:x"] {
        var u = try parse(line) catch err {
            println("skipped:", err)
            continue
        }
        println(u.Name, "is", u.Age)
    }
}`,
  },
  {
    id: "async",
    title: "Async",
    hint: "Tasks on every core",
    note: "Calling an async function without await starts it as a task. task.All waits for all of them on the multi-threaded scheduler.",
    src: `namespace crawler

import io
import net

async func size(url string) int! {
    var res = await http.Get(url)?
    return len(res.Body)
}

async func main() void! {
    var pending []Task<int!>
    for url in ["https://zell-lang.org", "https://go.dev"] {
        pending = append(pending, size(url))
    }
    // both requests run at once; the first error cancels the rest
    var sizes = await task.All(pending)?
    println(sizes)
}`,
  },
  {
    id: "http",
    title: "HTTP",
    hint: "In the standard library",
    note: "HTTP/1.1 and HTTP/2, TLS 1.3, routing and middleware ship with the standard library.",
    src: `namespace api

import net

async func Hello(req *http.Request, res *http.Response) void! {
    res.Text(200, "hello, " + req.Param("name") + "!\\n")
}

async func main() void! {
    var r = http.NewRouter()
    r.Get("/hello/{name}", Hello)

    var srv = http.Server{Addr: ":8080", Handler: r}
    srv.Listen()?
    await srv.Serve()?
}`,
  },
  {
    id: "json",
    title: "JSON",
    hint: "Compile-time reflection",
    note: 'Output: ann {"id":7,"Name":"ann"}. The encoder is generated at compile time from the struct and its attributes: no run-time reflection.',
    src: `namespace users

import encoding
import io

struct User {
    @json(name: "id") Id int
    Name string
    @json(omitEmpty: true) Email string
    @json(skip: true) password string
}

func main() void! {
    var u = json.Parse<User>("{\\"id\\": 7, \\"Name\\": \\"ann\\"}")?
    println(u.Name, json.Format(u))
}`,
  },
  {
    id: "enums",
    title: "Enums",
    hint: ["Data and exhaustive ", code("switch")],
    note: "Output: 6. Variants carry their own fields, and switch binds them by name.",
    src: `namespace shapes

import io

enum Shape {
    Circle(radius float)
    Rect(w float, h float)
}

// a missing case is a compile error, not a runtime surprise
func Area(s Shape) float {
    switch s {
        case Shape.Circle(r):
            return 3.14159 * r * r
        case Shape.Rect(w, h):
            return w * h
    }
}

func main() {
    println(Area(Shape.Rect(2.0, 3.0)))
}`,
  },
  {
    id: "defer",
    title: "Resources",
    hint: [code("defer await"), " and ", code("Drop")],
    note: "defer await runs at function exit on every path. Types with a Drop method are released when their last reference goes away.",
    src: `namespace cache

import data
import io

async func main() void! {
    var c = await redis.Connect("redis://localhost:6379/0")?
    // closed on every way out, \`?\` included
    defer await c.Close()

    await c.Set("greeting", "hello")?
    println(await c.Get("greeting")?)
}`,
  },
];
