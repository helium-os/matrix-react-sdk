/*
Copyright 2022 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from "react";
import { screen, render } from "@testing-library/react";

import {
    getUserOnboardingCounters,
    UserOnboardingList,
} from "../../../../src/components/views/user-onboarding/UserOnboardingList";
import SdkConfig from "../../../../src/SdkConfig";

const tasks = [
    {
        id: "1",
        title: "Lorem ipsum",
        description: "Lorem ipsum dolor amet.",
        completed: true,
    },
    {
        id: "2",
        title: "Lorem ipsum",
        description: "Lorem ipsum dolor amet.",
        completed: false,
    },
];

describe("getUserOnboardingCounters()", () => {
    it.each([
        {
            tasks: [],
            expectation: {
                completed: 0,
                waiting: 0,
                total: 0,
            },
        },
        {
            tasks: tasks,
            expectation: {
                completed: 1,
                waiting: 1,
                total: 2,
            },
        },
    ])("should calculate counters correctly", ({ tasks, expectation }) => {
        const result = getUserOnboardingCounters(tasks);
        expect(result).toStrictEqual(expectation);
    });
});

describe("UserOnboardingList", () => {
    // This configuration affects rendering of the feedback and needs to be set.
    beforeAll(() => {
        SdkConfig.put({
            bug_report_endpoint_url: "https://bug_report_endpoint_url.com",
        });
    });

    it("should not display feedback when there are waiting tasks", async () => {
        render(<UserOnboardingList tasks={tasks} />);

        expect(await screen.findByText("Only 1 step to go")).toBeVisible();
        expect(await screen.queryByTestId("user-onboarding-feedback")).toBeNull();
        expect(await screen.findAllByTestId("user-onboarding-task")).toHaveLength(2);
    });

    it("should display feedback when all tasks are completed", async () => {
        render(<UserOnboardingList tasks={tasks.map((task) => ({ ...task, completed: true }))} />);

        expect(await screen.findByText("You did it!")).toBeVisible();
        expect(await screen.findByTestId("user-onboarding-feedback")).toBeInTheDocument();
        expect(await screen.queryAllByTestId("user-onboarding-task")).toHaveLength(2);
    });
});
