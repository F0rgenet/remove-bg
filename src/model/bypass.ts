type Operators = ">" | "<" | "==";
type Task = { code: string; answers: number[]; isReverse: boolean; isPositive: boolean };
type RequestData = { challenge: string; response: string };

class ChallengeSolver {
    throwRegexError(target: string, additionalInfo: string = ""): void {
        let additional = "";
        if (additionalInfo) {
            additional = additionalInfo;
        }
        throw new Error(`Can't parse regex: ${target} ${additional}`);
    }

    async getToken(): Promise<string | void> {
        const maxRetries = 20;
        let retries = 0;
        let delay = 500;

        let requestData = { challenge: "", response: "" };

        while (retries < maxRetries) {
            console.log(`Trying to get token, attempt №${retries}`);
            const data = await this.tryGetToken(requestData);
            if (data.token) {
                console.log(`Got token: '${data.token}'`);
                return data.token;
            } else {
                console.log(`Got challenge: '${data.requestData.challenge}'`);
                requestData = data.requestData;
            }
            const backoffTime = delay * Math.pow(2, retries);
            await new Promise((resolve) => setTimeout(resolve, backoffTime));
            retries++;
        }
        console.error("Max retries exceeded");
    }

    private async fetchRequest(requestData: RequestData): Promise<{ challenge: string; response: string; token: string | void }> {
        const url = "https://api.removal.ai/web-token/request";
        const headers = { "Content-Type": "application/json" };
        const options = {
            method: "POST",
            body: requestData.challenge ? JSON.stringify(requestData) : null,
            headers: headers,
        };

        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url} with ${options}, status: ${response.status}`);
        }
        const json = await response.json();
        if (!json) {
            throw new Error(`Json parse failed: ${response}`);
        }
        return json;
    }

    private async tryGetToken(requestData: RequestData): Promise<{ token: string; requestData: RequestData }> {
        const data = await this.fetchRequest(requestData);
        let result: { token: string; requestData: RequestData } = { token: "", requestData: { challenge: "", response: "" } };
        if (data.token) {
            result.token = data.token;
        } else {
            if (!data.challenge) {
                throw new Error(`Missing challenge in data: ${JSON.stringify(data)}`);
            }

            let solution: string | null;
            solution = this.bypassChallenge(data.response);
            if (!solution) {
                throw new Error(`Failed to solve challenge: ${data.challenge}`);
            }
            result.requestData = { challenge: data.challenge, response: solution };
        }
        return result;
    }

    private bypassChallenge(base64Challenge: string): string {
        let result = [];
        const tasks = this.getChallengeTasksFromBase64(base64Challenge);
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            result.push(this.solveTask(task));
        }
        result = result.map((v, i) => (v * 2 + i) * 2);
        return btoa("[" + result.join(",") + "]");
    }

    private getChallengeTasksFromBase64(base64Challenge: string): Task[] {
        let data = atob(base64Challenge).split(",");
        data[0] = data[0].slice(1);
        data[data.length - 1] = data[data.length - 1].slice(0, data[data.length - 1].length - 1);
        let result = [];
        for (let i = 0; i < data.length; i++) {
            result.push(this.getChallengeLineTask(data[i]));
        }
        return result;
    }

    private getTaskPositive(challengeTaskCode: string): boolean {
        const positiveTasks = [
            "(document.body)",
            "(location.href.includes('removal'))",
            "(window.innerWidth)",
            "(window.innerHeight)",
            "(document.hasChildNodes())",
            "(document.body.childElementCount)",
        ];
        for (let i = 0; i < positiveTasks.length; i++) {
            if (challengeTaskCode.includes(positiveTasks[i]) || challengeTaskCode === positiveTasks[i]) {
                return true;
            }
        }
        return false;
    }

    private isTaskReverse(challengeTaskCode: string): boolean {
        return !!((challengeTaskCode.match(/!(?!=)/g) || []).length % 2);
    }

    private getChallengeLineTask(challengeLine: string): Task {
        const result = challengeLine.split("?");
        const code = result[0];
        const answers = result[1].split(":").map((value) => parseInt(value));
        const isReverse = this.isTaskReverse(code);
        const isPositive = this.getTaskPositive(code.replace(/!/g, ""));
        return { code: code, answers: answers, isReverse: isReverse, isPositive: isPositive };
    }

    private solveTask(task: Task): number {
        const mathSolution = this.solveMathTask(task.code, task.answers);
        if (mathSolution.isValid) {
            return mathSolution.answer;
        }
        let answerIndex = task.isPositive ? 0 : 1;
        if (task.isReverse) {
            answerIndex = answerIndex ? 0 : 1;
        }
        return task.answers[answerIndex];
    }

    private solveMathTask(challengeTaskCode: string, answers: number[]): { isValid: boolean; answer: number } {
        function solveComparison(numberA: number, numberB: number, operator: Operators): boolean {
            switch (operator) {
                case ">":
                    return numberA > numberB;
                case "<":
                    return numberA < numberB;
                case "==":
                    return numberA === numberB;
                default:
                    throw new Error("Wrong operator: " + operator);
            }
        }
        function solveParity(number: number): boolean {
            return solveComparison(number % 2, 0, "==");
        }
        let answerIndex = -1;
        const comparisonMatchResult = /(\d+)([><])(\d+)/g.exec(challengeTaskCode);
        const parityMatchResult = /(\d+)%2==0/g.exec(challengeTaskCode);
        if (comparisonMatchResult) {
            const numberA = parseInt(comparisonMatchResult[1]);
            const operator: Operators = comparisonMatchResult[2] as Operators;
            const numberB = parseInt(comparisonMatchResult[3]);
            if (!numberA || !operator || !numberB) {
                this.throwRegexError(challengeTaskCode, comparisonMatchResult.toString());
            }
            answerIndex = solveComparison(numberA, numberB, operator) ? 0 : 1;
        } else if (parityMatchResult) {
            const number = parseInt(parityMatchResult[1]);
            if (!number) {
                this.throwRegexError(challengeTaskCode, parityMatchResult[1]);
            }
            answerIndex = solveParity(number) ? 0 : 1;
        }
        return { isValid: answerIndex !== -1, answer: answers[answerIndex] };
    }
}

export default ChallengeSolver;
